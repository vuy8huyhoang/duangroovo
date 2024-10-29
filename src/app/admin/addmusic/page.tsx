"use client";
import { useState, useEffect } from "react";
import axios from "@/lib/axios";
import styles from "./AddMusic.module.scss";

interface Artist {
    id_artist: string;
    name: string;
    slug: string;
    url_cover: string;
}

interface Type {
    id_type: string;
    name: string;
    slug: string;
    created_at: string;
    is_show: number;
}

interface Composer {
    id_composer: string;
    name: string;
    created_at: string;
    last_update: string;
}

interface Song {
    id_music: string;
    name: string;
    slug: string;
    url_path: string; // URL for audio file
    url_cover: string; // URL for cover image
    total_duration: string | null;
    producer: string;
    composer: string | null;
    release_date: string | null;
    created_at: string;
    last_update: string;
    is_show: number;
    view: number;
    favorite: number;
    artists: string[];
    types: string[];
    composers: string[];
}

export default function AddMusic() {
    const [song, setSong] = useState<Song>({
        id_music: "",
        name: "",
        slug: "",
        url_path: "",
        url_cover: "",
        total_duration: null,
        producer: "",
        composer: null,
        release_date: null,
        created_at: new Date().toISOString(),
        last_update: new Date().toISOString(),
        is_show: 1,
        view: 0,
        favorite: 0,
        artists: [],
        types: [],
        composers: []
    });

    const [artists, setArtists] = useState<Artist[]>([]);
    const [types, setTypes] = useState<Type[]>([]);
    const [composers, setComposers] = useState<Composer[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // State for handling image upload
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // State for handling audio upload
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);

    const [message, setMessage] = useState<string>("");

    useEffect(() => {
        axios.get("/artist").then((response: any) => {
            setArtists(response?.result?.data || []);
        }).catch(() => setArtists([]));

        axios.get("/type").then((response: any) => {
            setTypes(response?.result?.data || []);
        }).catch(() => setTypes([]));

        axios.get("/composer").then((response: any) => {
            setComposers(response?.result?.data || []);
        }).catch(() => setComposers([]));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSong({ ...song, [name]: value });
    };

    const handleArtistSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedArtists = Array.from(e.target.selectedOptions, option => option.value);
        setSong({ ...song, artists: selectedArtists });
    };

    const handleTypeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedTypes = Array.from(e.target.selectedOptions, option => option.value);
        setSong({ ...song, types: selectedTypes });
    };

    const handleComposerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedComposers = Array.from(e.target.selectedOptions, option => option.value);
        setSong({ ...song, composers: selectedComposers });
    };

    // Handle file change for image upload
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);

            const fileUrl = URL.createObjectURL(e.target.files[0]);
            setPreviewUrl(fileUrl);
        }
    };

    const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAudioFile(e.target.files[0]);

            const audioUrl = URL.createObjectURL(e.target.files[0]);
            setAudioPreviewUrl(audioUrl);
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!file || !audioFile) {
            setMessage("Vui lòng chọn cả tệp ảnh và tệp âm thanh.");
            return;
        }

        setLoading(true);

        const songData = { ...song };
        const slug = song.name.toLowerCase().replace(/\s+/g, '-');
        songData.slug = slug;

        const imageFormData = new FormData();
        imageFormData.append("file", file);

        try {
            console.log("Đang tải lên ảnh...");
            const imageUploadResponse: any = await axios.post("/upload-image", imageFormData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            console.log("Phản hồi từ API (upload ảnh):", imageUploadResponse);

            const imageUrl = imageUploadResponse?.result?.url; 
            const audioFormData = new FormData();
            console.log(audioFormData);

            audioFormData.append("audio", audioFile);

            console.log("Đang tải lên âm thanh...");
            const audioUploadResponse: any = await axios.post("/upload-audio", audioFormData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            console.log("Phản hồi từ API (upload audio):", audioUploadResponse);
            const audioUrl = audioUploadResponse?.result?.url;

            if (audioUrl) {
                songData.url_path = audioUrl;

                const response = await axios.post("/music", songData, {
                    headers: { "Content-Type": "application/json" },
                });

                console.log("Phản hồi từ API (thêm bài hát):", response);

                if (response.status === 200 || response.status === 201) {
                    alert("Bài hát đã được thêm thành công!");
                    window.location.href = "/admin/adminmusic";
                } else {
                    alert("Thêm bài hát không thành công.");
                }
            } else {
                console.log("Không tìm thấy URL âm thanh trong phản hồi:", audioUploadResponse);
                setMessage("Lỗi khi tải tệp âm thanh lên.");
            }
            if (imageUrl) {
                songData.url_cover = imageUrl; 
                console.log("Tải lên ảnh thành công, URL:", imageUrl);

                
            } else {
                console.log("Không tìm thấy URL ảnh trong phản hồi:", imageUploadResponse.data);
                setMessage("Lỗi khi tải ảnh lên.");
            }
        } catch (error: any) {
            console.error("Lỗi khi gửi dữ liệu:", error);

            setMessage("Đã xảy ra lỗi khi gửi dữ liệu.");
        } finally {
            setLoading(false);
        }
    };















    return (
        <div className={styles.container}>
            <h2>Thêm mới bài hát</h2>
            <div className={styles.formGroup}>
                <input
                    type="text"
                    name="name"
                    placeholder="Tên bài hát"
                    value={song.name}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="producer"
                    placeholder="Nhà sản xuất"
                    value={song.producer}
                    onChange={handleChange}
                />

                <select onChange={handleArtistSelect} >
                    <option value="">Chọn nghệ sĩ</option>
                    {artists.map(artist => (
                        <option key={artist.id_artist} value={artist.id_artist}>
                            {artist.name}
                        </option>
                    ))}
                </select>

                <select onChange={handleTypeSelect} >
                    <option value="">Chọn thể loại</option>
                    {types.map(type => (
                        <option key={type.id_type} value={type.id_type}>
                            {type.name}
                        </option>
                    ))}
                </select>

                <select onChange={handleComposerSelect} >
                    <option value="">Chọn nhạc sĩ</option>
                    {composers.map(composer => (
                        <option key={composer.id_composer} value={composer.id_composer}>
                            {composer.name}
                        </option>
                    ))}
                </select>

                {previewUrl && (
                    <div className={styles.preview}>
                        <img src={previewUrl} alt="Xem trước ảnh bìa" />
                    </div>
                )}
                <label htmlFor="file-upload" className={styles.customFileUpload}>
                    Chọn ảnh bìa
                </label>
                <input
                    id="file-upload"
                    type="file"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />

                {audioPreviewUrl && (
                    <div className={styles.preview}>
                        <audio controls src={audioPreviewUrl}>
                            Trình duyệt của bạn không hỗ trợ phát âm thanh.
                        </audio>
                    </div>
                )}
                <label htmlFor="audio-upload" className={styles.customFileUpload}>
                    Chọn tệp âm thanh
                </label>
                <input
                    id="audio-upload"
                    type="file"
                    style={{ display: 'none' }}
                    onChange={handleAudioChange}
                />

                <button onClick={handleSubmit} disabled={loading}>
                    {loading ? "Đang gửi..." : "Thêm bài hát"}
                </button>
                {message && <div className={styles.message}>{message}</div>}
            </div>
        </div>
    );
}
