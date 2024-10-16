import { useEffect, useState } from 'react';
import axios from 'axios';
import style from './listalbum.module.scss'; // Import file CSS module
import { ReactSVG } from 'react-svg';

interface Album {
    id_album: string;
    name: string;
    url_cover: string;
}


export default function ListAlbum() {
    const [albumData, setAlbumData] = useState<Album[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlbumData = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/album');
                setAlbumData(response.data.data.slice(0, 5));  // Lấy 5 album như yêu cầu
            } catch (error) {
                console.error('Lỗi fetch album', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAlbumData();
    }, []);

    return (
        <>
            <div className={style.headerSection}>
                <h2>Chill</h2>
                <div className={style.all}>
                    <a href="#" className={style.viewAllButton}>Tất cả</a>
                    <ReactSVG className={style.csvg} src="/all.svg" />
                </div>
            </div>

            <div className={style.albumGrid}>
                {loading ? (
                    <p>Đang tải album...</p>
                ) : (
                    albumData.map((album) => (
                        <div key={album.id_album} className={style.albumCard}>
                            <div className={style.albumWrapper}>
                                <img src={album.url_cover} alt={album.name} className={style.albumCover} />
                                <div className={style.overlay}>
                                    <button className={style.likeButton}>
                                        <ReactSVG src="/heart.svg" />
                                    </button>
                                    <button className={style.playButton}>
                                        <ReactSVG src="/play.svg" />
                                    </button>

                                    <button className={style.moreButton}>
                                        <ReactSVG src="/more.svg" />
                                    </button>
                                </div>
                            </div>
                            <a className={style.albumTitle}>{album.name}</a>
                        </div>
                    ))
                )}
            </div>
        </>
    );
}
