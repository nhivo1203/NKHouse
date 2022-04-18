import React from 'react';
import { Link } from 'react-router-dom';

interface HeaderProps {
    title?: string;
}

const Header: React.FC<HeaderProps> = ({ title = 'NKMeet' }) => {
    return (
        <header className="h-12 bg-blue-700 flex items-center px-4">
            <Link to="/meet" className="text-white text-xl"> {title}</Link>
        </header>
    );
};

export default Header;
