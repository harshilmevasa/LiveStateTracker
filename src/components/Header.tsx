import React from 'react';

const Header = () => {
  return (
    <header className="w-full py-4 px-6 md:px-10 z-20 bg-background">
      <div className="container mx-auto flex justify-center md:justify-start">
        <div className="text-2xl md:text-3xl font-bold tracking-tight">
          <span className="text-muted-foreground">Alert </span>
          <span className="text-foreground">Me </span>
          <span className="text-muted-foreground">ASAP</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
