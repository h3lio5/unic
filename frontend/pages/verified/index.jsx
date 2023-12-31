import React, { useState, useEffect } from "react";

import { ToastContainer, toast } from "react-toastify";
import Webcam from "react-webcam";

import Address from "../../components/Address";
import { useRouter } from "next/router";
import metadata from "../../data/Verifier.json";

import {
  getEthereumObject,
  setupEthereumEventListeners,
  getSignedContract,
  getCurrentAccount,
  connectWallet,
} from "../../utils/ethereum";

import "react-toastify/dist/ReactToastify.css";

const VERIFIER_CONTRACT_ADDR = "0x7516223e25eF9B7a47680767899f9587cC9B92B4";
const REMOTE_IDENTITY_ADDR_CELO = "0xB46184729D705995493E2Fdc3cDF43d3a65Aee26";
const VERIFIER_CONTRACT_ABI = metadata.abi;

const primaryButtonClasses =
  "mt-10 flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-3 py-1 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 tracking-wide";

const Verified = () => {
  const router = useRouter();

  const [account, setAccount] = useState();
  const [unicContract, setUnicContract] = useState();
  const [polyCeloTxHash, setPolyCeloTxHash] = useState();

  const setupWallet = async () => {
    const ethereum = getEthereumObject();
    if (!ethereum) return;

    setupEthereumEventListeners(ethereum);

    const unicContract = getSignedContract(
      VERIFIER_CONTRACT_ADDR,
      VERIFIER_CONTRACT_ABI
    );

    if (!unicContract) return;

    const currentAccount = await getCurrentAccount();
    setUnicContract(unicContract);
    setAccount(currentAccount);
  };

  useEffect(() => {
    setupWallet();
  }, []);

  const isMetamaskConnected = !!account;

  const updateRemoteData = async () => {
    if (!window?.ethereum || !account) {
      toast.error("Please connect your MetaMask walet");
      return;
    }

    try {
      const result = await unicContract.updateRemote(
        44787,
        REMOTE_IDENTITY_ADDR_CELO,
        200000,
        { value: 2338284000000000 }
      );

      // Sample Hash - 0x226f367f200dc173028a09fdf7dd6376697b323a13bc8a984e4b903a6e0a0493 https://mumbai.polygonscan.com/tx/
      //setPolyCeloTxHash(result["hash"]);

      if (result) {
        toast.success("User added!");
        router.push("/verified");
        return;
      }
      toast.error("Invalid user details!");
    } catch (e) {
      toast.error("User already registered!");
    }
  };

  return (
    <div className="min-h-screen items-center py-2">
      <ToastContainer position="bottom-center" autoClose={1500} closeOnClick />

      <div className="flex my-4 text-center px-5 justify-end">
        {!isMetamaskConnected && (
          <button
            type="button"
            className="flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-3 py-1 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 tracking-wide"
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

      <div className="maximum-width-control">
        <h2 className="font-semibold text-lg bg-gradient-to-b from-sky-400 to-blue-600 bg-clip-text text-transparent">
          Add your identity on multiple chains
        </h2>

        <div className="mt-10 flex flex-row place-items-center">
          <h2 className="font-semibold text-sm w-1/2">CELO</h2>
          <button
            onClick={() => updateRemoteData()}
            className="flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-3 py-1 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 tracking-wide"
          >
            {polyCeloTxHash ? "Connected" : "Add Identity to chain"}
          </button>
        </div>
        {polyCeloTxHash && (
          <p className="text-xs">
            This transaction has been posted on chain. Check status{" "}
            <a href={`https://mumbai.polygonscan.com/tx/${polyCeloTxHash}`}>
              here
            </a>
          </p>
        )}

        <div className="mt-10 flex flex-row place-items-center">
          <h2 className="font-semibold text-sm w-1/2">Gnosis Chain</h2>
          <button className="flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-3 py-1 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 tracking-wide">
            Add Identity to chain
          </button>
        </div>
        {false && (
          <p className="text-xs">
            This transaction has been posted on chain. Check status{" "}
            <a
              className="text-sky-400"
              href={`https://mumbai.polygonscan.com/tx/${polyCeloTxHash}`}
            >
              here
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

export default Verified;
