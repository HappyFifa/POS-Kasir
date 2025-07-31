import React from 'react';

const PageHeader = ({ title, children }) => (
    <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-white">{title}</h1>
        <div>{children}</div>
    </div>
);

export default PageHeader;