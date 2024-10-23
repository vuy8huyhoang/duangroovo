import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import style from './albumhot.module.scss';
import { ReactSVG } from 'react-svg';

interface Album {
    id_album: string;
    name: string;
    url_cover: string;
    artist: {
        name: string;
    };
}

export default function AlbumHot() {
    const [albumData, setAlbumData] = useState<Album[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get("/album")
            .then((response: any) => {
                console.log(response); 
                if (response && response.result && response.result.data) {
                    const albumObj = response.result.data; 
                    setAlbumData(albumObj.slice(0, 5)); 
                } else {
                    console.error('Response result.data is undefined or null', response);
                }
            })
            .catch((error: any) => {
                console.error('Lỗi fetch album', error);
            })
            .finally(() => {
                setLoading(false); 
            });
    }, []);



    return (
        <>
            <div className={style.headerSection}>
                <h2>Mới phát hành</h2>
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
                            <p className={style.artistName}>{album.artist.name}</p>
                        </div>
                    ))
                )}
            </div>
        </>
    );
}