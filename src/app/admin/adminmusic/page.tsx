"use client";
import { useEffect, useState } from "react";
import axios from "@/lib/axios"; 
import styles from "./AdminMusic.module.scss";
import { ReactSVG } from "react-svg";


interface Song {
    id_music: string;
    name: string;
    composer: string;
    releaseDate: string;
    created_at: string;
    producer: string;
}

export default function AdminMusic() {
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        axios
            .get("/music")
            .then((response: any) => {
                console.log("Full API response:", response);
                if (response && response.result && response.result.data) {
                    setSongs(response.result.data);
                } else {
                    console.error("Response data is undefined or empty:", response);
                    setSongs([]); 
                }
            })
            .catch((error: any) => {
                console.error("Lỗi fetch bài hát:", error);
                setSongs([]); 
            })
            .finally(() => {
                setLoading(false); 
            });
    }, []);

    const handleDeleteSong = async (id_music: string) => {
        try {
            
            await axios.delete(`/music/${id_music}`);
            setSongs(songs.filter((song) => song.id_music !== id_music));
        } catch (error) {
            console.error("Lỗi xóa bài hát:", error);
        }
    };
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Quản lý bài hát</h1>
                <button className={styles.addButton}>
                    <ReactSVG className={styles.csvg} src="/plus.svg" />
                    <div className={styles.addText}>Tạo bài hát mới</div></button>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.songTable}>
                    <thead>
                        <tr>
                            <th>
                                <input type="checkbox" />
                            </th>
                            <th>ID</th>
                            <th>Tên bài hát</th>
                            <th>Ca sĩ</th>
                            <th>Ngày tạo</th>
                            <th>Nhà sản xuất</th>
                            <th>Tính năng</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} className={styles.loading}>
                                    Đang tải...
                                </td>
                            </tr>
                        ) : (
                            songs.map((song) => (
                                <tr key={song.id_music}>
                                    <td>
                                        <input type="checkbox" />
                                    </td>
                                    <td>#{song.id_music}</td>
                                    <td>{song.name}</td>
                                    <td>{song.composer}</td>
                                    <td>{song.created_at}</td>
                                    <td>{song.producer}</td>
                                    <td className={styles.actions}>
                                        <button className={styles.editButton}>
                                            <ReactSVG className={styles.csvg} src="/Rectangle 80.svg" /></button>
                                        <button className={styles.deleteButton}  onClick={() => handleDeleteSong(song.id_music)}>
                                            <ReactSVG className={styles.csvg} src="/Rectangle 79.svg"  /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
