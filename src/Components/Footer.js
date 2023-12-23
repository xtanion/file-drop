import React from 'react';
import './style.css'

const Footer = () => {
    return (
        <footer className='footer-copyright'>
            <p className="footer-heart">
                Made with
                <g-emoji className="g-emoji" alias="heart" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/2764.png">
                    <img className="emoji" alt="heart" height="12" width="12" margin="5" src="https://github.githubassets.com/images/icons/emoji/unicode/2764.png" />
                </g-emoji>
                in India | <a href="https://github.com/xtanion/file-drop">Github</a>
            </p>
      </footer>
)};

export default Footer;
