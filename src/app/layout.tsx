import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
	title: "Create Next App",
	description: "Generated by create next app",
};

export default function RootLayout({children}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
		<head>
			<link rel="preconnect" href="https://fonts.googleapis.com"/>
			<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin=""/>
			<link href="https://fonts.googleapis.com/css2?family=Kalnia:wght@100..700&display=swap" rel="stylesheet"/>
			<title>2048</title>
		</head>
		<body className={inter.className}>{children}</body>
		</html>
	);
}