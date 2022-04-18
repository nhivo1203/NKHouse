import React from 'react';
import { Alert } from 'antd';

interface Props {
    message?: string;
    description?: string;
}

export const ErrorBanner = ({
    message = "Uh oh! Có gì sai rồi :(",
    description = "Trông như có gì đó lỗi rồi. Hãy kiểm tra kết nối và/hoặc thử kết nối lại"
}: Props) =>{
    return (
        <Alert
            banner
            closable
            message = {message}
            description = {description}
            type="error"
            className="error-banner"
        />
    )
};