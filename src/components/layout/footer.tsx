import React from 'react';

export const Footer: React.FC = () => {
    const currentYear: number = new Date().getFullYear();

    return (
        <footer className="bg-background py-2 sm:py-4 border-t border-base-300">
            <div className="container mx-auto px-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        © {currentYear} JobSight. All rights reserved.
                    </p>
                    <div className="flex space-x-4">
                        <a href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Privacy Policy
                        </a>
                        <a href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Terms of Service
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;