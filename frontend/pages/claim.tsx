import React, { useState, useEffect } from "react";

import type { NextPage } from "next";
import Head from "next/head";

import axios from "axios";
import { Tensor, InferenceSession } from "onnxjs";
import { ToastContainer, toast } from "react-toastify";
import Webcam from "react-webcam";

import Address from "../components/Address";
import ClassifyResult from "../components/ClassifyResult";
import Footer from "../components/Footer";
import { useRouter } from "next/router";

import WorldIDWidget from "../components/WorldIDWidget";

import {
  getEthereumObject,
  setupEthereumEventListeners,
  getSignedContract,
  getCurrentAccount,
  connectWallet,
} from "../utils/ethereum";

import { buildContractCallArgs, generateProof } from "../utils/snark";
import { computeQuantizedEmbedding } from "../utils/model";

import metadata from "../data/unic.json";

import "react-toastify/dist/ReactToastify.css";

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "user",
};

const UNIC_CONTRACT_ADDR = "0xAE5bE8fBfeCC7baF3ee368313EcB173E9dab0e73";
const UNIC_CONTRACT_ABI: any = metadata.abi;

const mlModelUrl = "/frontend_model.onnx";

const title = "ZK Face Recognition";
const description =
  "Recognizing faces privately using ZK Snarks and Machine Learning";

// const appHeading = "ZK Face Recognition";
// const appDescription =
//   "In this app, we use ZK Snarks and Machine Learning to recognize a face privately";

const primaryButtonClasses =
  "mt-10  flex items-center justify-center rounded-2xl border border-transparent bg-white px-14  py-4 text-xl font-medium text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 tracking-wide";

// const titlePart1 = "Connect with the world effortlessly with";
// const titlePart2 = "Sapien";

const Claim: NextPage = () => {
  const router = useRouter();
  //   const [isModelLoaded, setIsModelLoaded] = useState(false);
  //   const [session, setSession] = useState<any>();

  const [account, setAccount] = useState();
  const [unicContract, setUnicContract] = useState<any>();

  //   const [prediction, setPrediction] = useState<null | number>();
  //   const [embedding, setEmbedding] = useState<number[]>();
  //   const [proof, setProof] = useState<any>("0xabcdef");
  //   const [selectedImage, setSelectedImage] = useState<any>();

  //   const [image, setImage] = useState(null);

  //   const [webcam, setWebcam] = useState(false);
  //   const [validated, setValidated] = useState(false);

  const checkClaim = async () => {
    // @ts-ignore
    if (!window?.ethereum || !account) {
      toast.error("Please connect your MetaMask wallet");
      return;
    }

    try {
      const result = await unicContract.checkClaimEligibility();
      console.log("result", result);

      if (result) {
        toast.success("You are eligible to claim your airdrop!");
        return;
      } else {
        toast.error("You are NOT eligible to claim your airdrop!");
      }
    } catch (e) {
      toast.error("Something went wrong!");
    }
  };
  const claim = async () => {
    // @ts-ignore
    if (!window?.ethereum || !account) {
      toast.error("Please connect your MetaMask wallet");
      return;
    }

    try {
      const result = await unicContract.claim();
      console.log("result", result);

      if (result) {
        toast.success("You are eligible to claim your airdrop!");
        return;
      } else {
        toast.error("You are NOT eligible to claim your airdrop!");
      }
    } catch (e) {
      toast.error("Something went wrong!");
    }
  };
  const setupWallet = async () => {
    const ethereum = getEthereumObject();
    if (!ethereum) return;

    setupEthereumEventListeners(ethereum);

    const contract = getSignedContract(UNIC_CONTRACT_ADDR, UNIC_CONTRACT_ABI);

    if (!contract) return;

    const currentAccount = await getCurrentAccount();
    setUnicContract(contract);
    setAccount(currentAccount);
  };

  useEffect(() => {
    setupWallet();
  }, []);

  const isMetamaskConnected = !!account;

  return (
    <div className="items-center min-h-screen py-2 ">
      <Head>
        <title>Show Your Unique Identity</title>
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta
          property="og:image"
          content="https://ethereum-bootcamp-frontend.vercel.app/og-image.png"
        />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <ToastContainer position="bottom-center" autoClose={1500} closeOnClick />

      <div className="flex my-4 text-center px-5 justify-between">
        <div className="flex justify-center items-center">
          <span
            className="w-20  h-20 block"
            style={{
              backgroundImage: `url('/unic_logo.png')`,
              backgroundPosition: "center",
              backgroundSize: "cover",
            }}
          ></span>
          <div
            className="font-bold text-white sm:text-8xl lg:text-[4rem]"
            onClick={() => router.push("/")}
          >
            UNIC
          </div>
        </div>

        {!isMetamaskConnected && (
          <button
            type="button"
            className="flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-14  py-8 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 tracking-wide"
            onClick={connectWallet}
          >
            Connect Wallet
          </button>
        )}
        {isMetamaskConnected && (
          <div className="flex w-full items-center gap-2 mx-auto justify-end">
            <Address address={account} />
          </div>
        )}
      </div>
      <div className="flex justify-center items-center ">
        <div className="flex flex-row mt-20 gap-10">
          <button
            type="button"
            className={primaryButtonClasses}
            onClick={() => checkClaim()}
          >
            Check Claim Eligibility
          </button>{" "}
          <button
            type="button"
            className={primaryButtonClasses}
            onClick={() => claim()}
          >
            Claim
          </button>
        </div>
      </div>
    </div>
  );
};

export default Claim;
