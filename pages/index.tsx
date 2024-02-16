import Head from "next/head";
import { Inter } from "next/font/google";
import * as React from 'react';
import Image from 'next/image';
import Link from "@mui/material/Link";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import { blue } from '@mui/material/colors';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <>
      <Head>
        <title>ToDo App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.paper",
          height: "auto",
          padding: "0px",
          margin: "40px",
          background: "lightgreen",
          borderRadius: 40,
        }}>
          <Link
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
        >
          <Box
            sx={{
              boxShadow: 1,
              borderRadius: 1,
              minWidth: 500,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          > 
            Powered by{' '}
            <Image 
            src="/vercel.svg" 
            alt="Vercel"
            width ={80}
            height={80}
            />
          </Box>
        </Link>
        </Box>
    </>
  );
}
