import React from "react";

interface Props {
  session: string;
  column: string;
}

const Header: React.FC<Props> = ({ session, column }) => {
  return (
    <>
      <h1 className="text-xl font-bold text-center mb-2">
        {session}
      </h1>
      <p className="text-center text-sm text-gray-500 mb-6">
        Column: {column}
      </p>
    </>
  );
};

export default Header;