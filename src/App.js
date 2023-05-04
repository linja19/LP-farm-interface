import styles from './App.css';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers'
import { useWeb3React } from '@web3-react/core';
import { useConnectWallet, callContract } from './utils/utils';
import LPFarmABI from './abis/LPFarm.json';
import MintableToken from './abis/MintableToken.json';

function App() {
  const [depositAmount, setDepositAmount] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [userlpTokenA, setUserLpTokenA] = useState(0);
  const [userlpTokenB, setUserLpTokenB] = useState(0);
  const [userlpTokenC, setUserLpTokenC] = useState(0);
  const [poollpTokenA, setPoolLpTokenA] = useState(0);
  const [poollpTokenB, setPoolLpTokenB] = useState(0);
  const [poollpTokenC, setPoolLpTokenC] = useState(0);
  const [rewardTokenAmount, setRewardTokenAmount] = useState(0);
  const [transaction,setTransaction] = useState("")
  const { account, active, library } = useWeb3React()
  const chainId = 80001;
  const LPA = "0xcD11050dcd665CA4E6bD8cf4BC437106552436D9";
  const LPB = "0x4535D8CecbEA2574cBc7125A49d0CCF60AEB1cE6";
  const LPC = "0xDDBABbefcA0600330B87AE9aE279bbaF678c9c3C";
  const REW = "0x5B6810E87aa491890216466507dCe10d9bEbc40A";
  const LPFarm = "0x48B98c5594594d297ce6286A11B1dfa35717fb60"
  const providerUrl = "https://rpc-mumbai.maticvigil.com";

  

  // const provider = new ethers.providers.JsonRpcProvider(providerUrl);
  const connectWalletByLocalStorage = useConnectWallet()

  // Use effect to fetch LP token and reward token amounts from the contract
  useEffect(() => {
    // await updateAllTokenBalances();
    // Call contract function to get LP token and reward token amounts
    // and set the values using setLpTokenAmount and setRewardTokenAmount
  }, []);

  // const LPA_contract = new ethers.Contract(LPA, MintableToken.abi, library.getSigner())

  const connect = async () => {
    connectWalletByLocalStorage();
    // await updateAllTokenBalances();
  }

  useEffect(() => {
    if (account){
      updateAllTokenBalances();
    }
  }, [account]);

  const updateAllTokenBalances = async () => {
    const userLpTokenA = await getUserTokenBalance(LPA)
    // console.log("LPA",userLpTokenA)
    const userLpTokenB = await getUserTokenBalance(LPB)
    const userLpTokenC = await getUserTokenBalance(LPC)
    const rewardTokenAmount = await getRewardTokenBalance()
    const poolLpTokenA = await getPoolTokenBalance(LPA)
    // console.log("poolTokenA",ethers.utils.formatUnits(poolLpTokenA,18))
    const poolLpTokenB = await getPoolTokenBalance(LPB)
    const poolLpTokenC = await getPoolTokenBalance(LPC)
    
    setUserLpTokenA(ethers.utils.formatUnits(userLpTokenA.amount,18))
    setUserLpTokenB(ethers.utils.formatUnits(userLpTokenB.amount,18))
    setUserLpTokenC(ethers.utils.formatUnits(userLpTokenC.amount,18))
    setPoolLpTokenA(ethers.utils.formatUnits(poolLpTokenA,18))
    setPoolLpTokenB(ethers.utils.formatUnits(poolLpTokenB,18))
    setPoolLpTokenC(ethers.utils.formatUnits(poolLpTokenC,18))
    setRewardTokenAmount(ethers.utils.formatUnits(rewardTokenAmount,18))
  }

  const getUserTokenBalance = async (tokenAddress) => {
    const LPcontract = new ethers.Contract(LPFarm, LPFarmABI.abi, library.getSigner())
    const balance = await LPcontract.userBalances(account,tokenAddress)
    return balance
  }

  const getPoolTokenBalance = async (tokenAddress) => {
    const LPcontract = new ethers.Contract(LPFarm, LPFarmABI.abi, library.getSigner())
    const balance = await LPcontract.LPTokenBalances(tokenAddress)
    return balance
  }

  const getRewardTokenBalance = async () => {
    const rewContract = new ethers.Contract(REW, MintableToken.abi, library.getSigner())
    const balance = await rewContract.balanceOf(account)
    return balance
  }

  const handleDeposit = async (token) => {
    console.log(depositAmount)
    const LPcontract = new ethers.Contract(LPFarm, LPFarmABI.abi, library.getSigner())
    const tokenContract = new ethers.Contract(token, MintableToken.abi, library.getSigner())

    const tokenAmount = ethers.utils.parseEther(depositAmount);

    const allowance = await tokenContract.allowance(account,LPFarm);
    if (allowance<=tokenAmount){
      const appr = await tokenContract.approve(LPFarm, tokenAmount);
      const approveTX = await appr.wait();
    }

    const res = await LPcontract.stake(
      token,
      tokenAmount
    )
    setTransaction("Pending...")

    setDepositAmount("");

    await res.wait()
    console.log("res",res)
    setTransaction(res.hash)
    await updateAllTokenBalances();
  };

  // Handle withdrawing LP tokens
  const handleWithdraw = async (token) => {
    // Call contract function to withdraw LP tokens
    // and update lpTokenAmount state with the new value
    const tokenAmount = ethers.utils.parseEther(withdrawAmount);
    const LPcontract = new ethers.Contract(LPFarm, LPFarmABI.abi, library.getSigner())
    const res = await LPcontract.unstake(
      token,
      tokenAmount
    )
    setTransaction("Pending...")
    setWithdrawAmount("");

    await res.wait()
    console.log("res",res)
    setTransaction(res.hash)
    await updateAllTokenBalances();
  };

  // Handle claiming reward tokens
  const handleClaimRewards = async () => {
    const LPcontract = new ethers.Contract(LPFarm, LPFarmABI.abi, library.getSigner())
    const res = await LPcontract.claimRewards()
    setTransaction("Pending...")
    await res.wait()
    console.log("res",res)
    setTransaction(res.hash)
    await updateAllTokenBalances();
  };

  const handleChangeDeposit = (e) => {
    setDepositAmount(e.target.value);
    console.log("deposit",depositAmount)
  };

  const handleChangeWithdraw = (e) => {
    setWithdrawAmount(e.target.value);
    console.log("withdraw",withdrawAmount)
  };

  return (
    <div>
      <button onClick={connect}>Connect Wallet</button>
      <h1>Account Info</h1>
      <h3>Account: {account}</h3>
      <h3>User Reward Token Balance: {rewardTokenAmount}</h3>
      <h3>LPA Token Balance In Farm: {userlpTokenA}  &ensp; LPB Token Balance In Farm: {userlpTokenB}  &ensp;  LPC Token Balance In Farm: {userlpTokenC}</h3>
      <text>Deposit Amount:&ensp;</text>
      <input type="text" onChange={handleChangeDeposit} placeholder="Deposit Amount" />
      <text>&emsp;Withdraw Amount:&ensp;</text>
      <input type="text" onChange={handleChangeWithdraw} placeholder="Withdraw Amount" />
      <div>
        <button onClick={()=>{handleDeposit(LPA)}} style={styles.button}>Deposit LPA Tokens</button>
        &emsp;
        <button onClick={()=>{handleWithdraw(LPA)}}>Withdraw LPA Tokens</button>
      </div>
      <div>
        <button onClick={()=>{handleDeposit(LPB)}}>Deposit LPB Tokens</button>
        &emsp;
        <button onClick={()=>{handleWithdraw(LPB)}}>Withdraw LPB Tokens</button>
      </div>
      <div>
        <button onClick={()=>{handleDeposit(LPC)}}>Deposit LPC Tokens</button>
        &emsp;
        <button onClick={()=>{handleWithdraw(LPC)}}>Withdraw LPC Tokens</button>
      </div>
      <button onClick={handleClaimRewards}>Claim Reward Tokens</button>
      <h1>LP Farm Info</h1>
      <h3>LPA Weight: 50% &ensp; LPB Weight: 30% &ensp; LPC Weight: 20%</h3>
      <h3>LPA Token Balance: {poollpTokenA}  &ensp; LPB Token Balance: {poollpTokenB}  &ensp;  LPC Token Balance: {poollpTokenC}</h3>
      <h1>Transaction</h1>
      <h3>{transaction}</h3>
    </div>
  );
}

export default App;
