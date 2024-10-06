// /app/marketing/layout.tsx
import React from 'react';

const MarketingLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <html lang="en">
        <body>
        <header>
            {/* Add your marketing header or navbar here */}
            <nav>Marketing Navbar</nav>
        </header>
        <main>{children}</main>
        <footer>
            {/* Add your marketing footer here */}
            <div>Marketing Footer</div>
        </footer>
        </body>
        </html>
    );
};

export default MarketingLayout;
