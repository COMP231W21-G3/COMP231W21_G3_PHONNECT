import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import M from 'materialize-css';
import PreLoader from '../Preloader';


const EditPost = () => { 
    const history = useHistory();
    const [caption, setCaption] = useState("");
    const [images, setImages] = useState([]);
    const [urls, setUrls] = useState();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState();
    const { postId } = useParams();

    const addImage = (e) => {
        setImages([...images, ...e.target.files]);
    }

    const postDetails = async () => {
        setLoading(true);
        const copyUrls = [];

        for (let im of images) {
            const data = new FormData();
            data.append("file", im);
            data.append("upload_preset", "phongstagram");
            data.append("cloud_name", "phongcloudinary");
            let cloudinaryRes = await fetch("https://api.cloudinary.com/v1_1/phongcloudinary/upload", {
                method: "post",
                body: data
            });
            let fetchedData = await cloudinaryRes.json();
            copyUrls.push(fetchedData.url);
        }
        console.log("photos array",copyUrls);
        setUrls(copyUrls);
    }

    useEffect(() => {       
        if (urls) {
            fetch(`/editpost/${postId}`, {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("jwt")
                },
                body: JSON.stringify({
                    caption,
                    photos: urls
                })
            })
                .then(res => res.json())
                .then(data => {
                    setLoading(false);
                    console.log(data);
                    setData(data.post);
                    data.images.map((image) => addImage(image))
                    setCaption(data.caption)
                    
                    if (data.error) {
                        M.toast({ html: data.error, classes: "#c62828 red darken-1" });
                    }
                    else {
                        M.toast({ html: "Edited Post Successfully!", classes: "#43a047 green darken-1" });
                        history.push('/');
                    }
                }).catch(err => {
                    console.log(err);
                })
        }
        
    }, [urls])

    return (
        <div className="card input-field"
            style={{
                margin: "30px auto",
                maxWidth: "500px",
                padding: "20px",
                textAlign: "center"
            }}>
       
            <input type="text" placeholder="caption"
                value={caption}
                onChange={e => setCaption(e.target.value)} 
            />
            <div className="card-image" style={{ padding: "20px" }}>

                {
                    images.length === 0 ? <img className="upload-img" src="https://www.worldloppet.com/wp-content/uploads/2018/10/no-img-placeholder.png" />
                        :
                        images.map((im, i) =>im.name.substring(im.name.lastIndexOf('.')+1,im.name.length).match(/(jpg|jpeg|png|gif)$/i)?
                        <img className="upload-img" key={i}
                                src={images.length > 0 ? URL.createObjectURL(im) : null}></img>    
                        :<video className="upload-img" key={i} frameBorder="0" controls
                                src={images.length > 0 ? URL.createObjectURL(im) : null}></video>)
                }
            </div>
            <div className="file-field input-field">
                <div className="btn waves-effect waves-light #1976d2 blue darken-1">
                    <span>Upload Image(s)</span>
                    <input type="file" accept="image/jpg,image/jpeg,image/png,image/gif,video/mp4" multiple 
                        onChange={(e)=>addImage(e)} />
                </div>
                <div className="file-path-wrapper">
                    <input className="file-path validate" type="text" placeholder="No Image" disabled />
                </div>
            </div>
            <button className="btn waves-effect waves-light #1976d2 blue darken-1"
                onClick={() => postDetails()}
            >
                Edit Post
            </button>

            {loading ?
                <div style={{ display: "flex", justifyContent: "center", margin: "20px" }}>
                    <PreLoader></PreLoader>
                </div>
                : null}

        </div>
    )
}

export default EditPost