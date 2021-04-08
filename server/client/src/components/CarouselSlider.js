import React, { useEffect } from 'react';
import M from 'materialize-css';

const CarouselSlider = ({ item }) => {

    useEffect(
        () => {
            var options = {
                fullWidth: true,
                indicators: true
            };
            var carousel = document.querySelectorAll('.carousel');
            M.Carousel.init(carousel, options);
        }, []
    )

    const chevronRight = () => {
        var elems = document.getElementById(`carousel-${item._id}`);
        var moveRight = M.Carousel.getInstance(elems);
        moveRight.next(1);
    }

    const chevronLeft = () => {
        var elems = document.getElementById(`carousel-${item._id}`);
        var moveLeft = M.Carousel.getInstance(elems);
        moveLeft.prev(1);
    }

    return (
        <div id={`carousel-${item._id}`} className="carousel carousel-slider" style={{ display: "inline-block" }}>

            {
                item.photos.length > 1 &&
                <div className="carousel-fixed-item center middle-indicator">
                    <div className="left">
                        <a href="#!" onClick={()=>chevronLeft()} className="middle-indicator-text waves-effect waves-light content-indicator"><i
                            className="material-icons left  middle-indicator-text">chevron_left</i></a>
                    </div>

                    <div className="right">
                        <a href="#!" onClick={()=>chevronRight()} className="middle-indicator-text waves-effect waves-light content-indicator"><i
                            className="material-icons right middle-indicator-text">chevron_right</i></a>
                    </div>
                </div>
            }

            {
                item.photos.map((photo, index) => {
                    return (
                        <a className="carousel-item" key={index}>
                            {
                                photo.substring(photo.lastIndexOf('.') + 1, photo.length).match(/(jpg|jpeg|png|gif)$/i) ?
                                    <img src={photo} />
                                    : <video className="responsive-video" src={photo} frameBorder="0" controls />
                            }
                        </a>
                    )

                })
            }

        </div>
    )
}

export default CarouselSlider