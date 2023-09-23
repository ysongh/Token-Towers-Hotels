import { BOARD_STYLES } from "../components/board/style";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { MetaHeader } from "~~/components/MetaHeader";
import deployedContracts from "~~/generated/deployedContracts";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

const CHAIN_ID = 31337;

const Board: NextPage = () => {
  const { address } = useAccount();

  const { data: tbaAddress } = useScaffoldContractRead({
    contractName: "OnChainBoardGame",
    functionName: "tbaList",
    args: [address],
  });

  const { data: hotels } = useScaffoldContractRead({
    contractName: "OnChainBoardGame",
    functionName: "getHotels",
  });

  const { data: you } = useScaffoldContractRead({
    contractName: "OnChainBoardGame",
    functionName: "tbaNFT",
    args: [tbaAddress],
  });

  const { writeAsync: createAccount } = useScaffoldContractWrite({
    contractName: "OnChainBoardGame",
    functionName: "createTokenBoundAccount",
    args: [
      deployedContracts[CHAIN_ID][0].contracts.ERC6551Account.address,
      BigInt("1"),
      deployedContracts[CHAIN_ID][0].contracts.OnChainBoardGame.address,
      BigInt("0"),
      BigInt("1"),
      "0x",
    ],
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
    },
  });

  const { writeAsync: roll } = useScaffoldContractWrite({
    contractName: "OnChainBoardGame",
    functionName: "moveNFT",
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
    },
  });

  return (
    <>
      <MetaHeader
        title="Example UI | Scaffold-ETH 2"
        description="Example UI created with 🏗 Scaffold-ETH 2, showcasing some of its features."
      >
        {/* We are importing the font this way to lighten the size of SE2. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Bai+Jamjuree&display=swap" rel="stylesheet" />
      </MetaHeader>
      <div className="grid lg:grid-cols-2 flex-grow" data-theme="exampleUi">
        <div className="mt-5">
          <div>
            <div className="flex">
              <div>
                <h2 className="mt-4 text-3xl">Board</h2>
                <p>{tbaAddress}</p>
                <button
                  className="py-2 px-16 mb-10 mt-3 bg-green-500 rounded baseline hover:bg-green-300 disabled:opacity-50"
                  onClick={() => createAccount()}
                >
                  Create Token Bound Account
                </button>
                <button
                  className="py-2 px-16 mb-1 mt-3 mr-3 bg-blue-400 rounded baseline hover:bg-blue-300 disabled:opacity-50"
                  onClick={() => roll()}
                >
                  Roll
                </button>
                <div className="relative mt-3" style={{ width: "450px", height: "600px" }}>
                  {hotels &&
                    hotels.map((item, index) => (
                      <div
                        key={index}
                        className={
                          "w-20 h-20 border border-gray-300 font-bold bg-white" + " " + BOARD_STYLES[index] || "grid-1"
                        }
                      >
                        {item.id.toString()}
                        {you?.toString() === item.id.toString() && <p className="my-0">You</p>}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Board;