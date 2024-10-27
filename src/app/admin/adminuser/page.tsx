"use client";
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import styles from "./AdminUser.module.scss";
import { ReactSVG } from "react-svg";
import Link from 'next/link';

interface User {
    id_user: string;
    fullname: string;
    email: string;
    role: 'user' | 'admin';
    url_avatar?: string;
    is_banned: boolean;
}

export default function AdminUser() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
    const usersPerPage = 10;

    useEffect(() => {
        axios.get("/auth/user")
            .then((response: any) => {
                setCurrentUserRole(response.data.role);
            })
            .catch((error: any) => {
                console.error("Lỗi lấy thông tin người dùng:", error);
            });

        axios
            .get("/user")
            .then((response: any) => {
                if (response && response.result && response.result.data) {
                    setUsers(response.result.data);
                } else {
                    console.error("Response data is undefined or empty:", response);
                    setUsers([]);
                }
            })
            .catch((error: any) => {
                console.error("Lỗi fetch user:", error);
                setUsers([]);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const handleBanUser = async (id_user: string, isBanned: boolean) => {
        try {
            await axios.patch(`/user/${id_user}`, { is_banned: !isBanned });
            setUsers(users.map((user) =>
                user.id_user === id_user ? { ...user, is_banned: !isBanned } : user
            ));
        } catch (error) {
            console.error("Lỗi khóa/mở khóa user:", error);
        }
    };

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(users.length / usersPerPage);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Quản lý user</h1>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.userTable}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Avatar</th>
                            <th>Tên đầy đủ</th>
                            <th>Email</th>
                            <th>Vai trò</th>
                            <th>Trạng thái</th>
                            {currentUserRole === 'admin' && <th>Tính năng</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} className={styles.loading}>Đang tải...</td>
                            </tr>
                        ) : (
                            currentUsers.map((user) => (
                                <tr key={user.id_user}>
                                    <td>#{user.id_user}</td>
                                    <td><img src={user.url_avatar || "/default-avatar.png"} alt="Avatar" /></td>
                                    <td>{user.fullname}</td>
                                    <td>{user.email}</td>
                                    <td>{user.role}</td>
                                    <td>{user.is_banned ? "Bị khóa" : "Hoạt động"}</td>
                                    {currentUserRole === 'admin' && (
                                        <td className={styles.actions}>
                                            <button className={styles.editButton}>
                                                <Link href={`/admin/edituser/${user.id_user}`} passHref>
                                                    <ReactSVG className={styles.csvg} src="/edit-icon.svg" />
                                                </Link>
                                            </button>
                                            <button
                                                className={styles.banButton}
                                                onClick={() => handleBanUser(user.id_user, user.is_banned)}
                                            >
                                                <ReactSVG
                                                    className={styles.csvg}
                                                    src={user.is_banned ? "/unlock-icon.svg" : "/lock-icon.svg"}
                                                />
                                                {user.is_banned ? "Mở khóa" : "Khóa"}
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className={styles.pagination}>
                {[...Array(totalPages)].map((_, index) => (
                    <button
                        key={index}
                        onClick={() => paginate(index + 1)}
                        className={currentPage === index + 1 ? styles.activePage : ''}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        </div>
    );
}