import React from "react";

type PrivateRouteProps = {
  children: React.ReactNode;
  role?: string;
};

export default function PrivateRoute({
  children,
}: PrivateRouteProps) {
  return <>{children}</>;
}