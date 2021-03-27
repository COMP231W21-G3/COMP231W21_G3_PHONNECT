import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import M from 'materialize-css';
import PreLoader from '../Preloader';

const CreatePost = () => {
    const history = useHistory();
    const [caption, setCaption] = useState("");
    const [urls, setUrls] = useState();
    const [loading, setLoading] = useState(false);
    const OPTIONS = ["One", "Two", "Three"];
    const [allHobbies, setAllHobbies] = useState(OPTIONS);
    const [selectedHobbies, setSelectedHobbies] = useState([]);

    const postDetails = async () => {
        setLoading(true);
        const copyUrls = [];
        setUrls(copyUrls);
    }

    useEffect(() => {       
        if (urls) {
            fetch("/meetastranger", {
                method: "get",
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
                        M.toast({ html: "Form Submitted!", classes: "#43a047 green darken-1" });
                        history.push('/');
                    }
                }).catch(err => {
                    console.log(err);
                })
        }
        
    }, [urls])

    const handleAddHobby = value => () => {
        console.log("add");
        const newList = allHobbies.filter((item) => item !== value);
        setAllHobbies(newList);

        const newList2 = selectedHobbies.concat(value);
        setSelectedHobbies(newList2);

      };

    const handleRemoveHobby = value => () => {
        console.log("remove");
        const newList = selectedHobbies.filter((item) => item !== value);
        setSelectedHobbies(newList);

        const newList2 = allHobbies.concat(value);
        setAllHobbies(newList2);
    };

    const HobbyButton = ({ label, onClick }) => (
          <button
              name={label}
              onClick={onClick(label)}
              className="hobbies">
            {label} 
          </button>
          );
  
    return (
        
        <div className="card input-field"
            style={{
                margin: "30px auto",
                maxWidth: "500px",
                padding: "20px",
                textAlign: "center"
            }}>

            <div className="file-field input-field">
                <h4>Meet a Stranger</h4>
                <br></br>
                <h4>Hobbies:</h4>
                {allHobbies[0]
                ?allHobbies.map((option) => (
                
              <HobbyButton  onClick={handleAddHobby} label={option}/>
              ))
                : <h5><i>No more available Hobbies!</i></h5>
            }

            <h4><br/>Selected Hobbies:</h4>
                {selectedHobbies[0]
                ?selectedHobbies.map((option) => (
                
                <HobbyButton onClick={handleRemoveHobby} label={option}/>
                ))
                : <h5><i>Select a few hobbies to find a match!</i></h5>
            }
 
            </div><br/>
            <button className="btn waves-effect waves-light #1976d2 blue darken-1"
                onClick={() => postDetails()}
            >
                Find a Match
            </button>

        </div>
    )
}

export default CreatePost