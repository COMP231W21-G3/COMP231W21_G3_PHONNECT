import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import M from 'materialize-css';
import PreLoader from '../Preloader';

const CreatePost = () => {
    const history = useHistory();
    const [caption, setCaption] = useState("");
    const [images, setImages] = useState([]);
    const [urls, setUrls] = useState();
    const [loading, setLoading] = useState(false);

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

    const removeImage=(im)=>{
        const newImages=images.filter(image=>image.name!=im.name);
        setImages(newImages);
    }

    useEffect(() => {       
        if (urls) {
            fetch("/createpost", {
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
                    if (data.error) {
                        M.toast({ html: data.error, classes: "#c62828 red darken-1" });
                    }
                    else {
                        M.toast({ html: "Created Post Successfully!", classes: "#43a047 green darken-1" });
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
                        <div key={i} style={{position:"relative"}}>
                        <img className="upload-img"
                                src={images.length > 0 ? URL.createObjectURL(im) : null}></img>
                        <a className="btn-floating red" style={{position:"absolute",right:"0px",top:"0px",zIndex:"1",cursor:"pointer"}}>
                            <i className="small material-icons col s2" onClick={()=>removeImage(im)}>delete</i></a>
                        </div>
                        
                        :
                        <div key={i} style={{position:"relative"}}>
                        <video className="upload-img" frameBorder="0" controls
                                src={images.length > 0 ? URL.createObjectURL(im) : null}></video>
                        <a className="btn-floating red" style={{position:"absolute",right:"0px",top:"0px",zIndex:"1",cursor:"pointer"}}>
                            <i className="small material-icons col s2" onClick={()=>removeImage(im)}>delete</i></a>
                        </div>)
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
                Submit Post
            </button>

            {loading ?
                <div style={{ display: "flex", justifyContent: "center", margin: "20px" }}>
                    <PreLoader></PreLoader>
                </div>
                : null}

        </div>
    )
}

export default CreatePost