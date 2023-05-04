import { InjectedConnector } from '@web3-react/injected-connector';
import { useWeb3React } from '@web3-react/core';
import { useState, useCallback } from "react"

const injected = new InjectedConnector({
    supportedChainIds: [80001],
});

export const useConnectWallet=()=> {
    const { activate, deactivate } = useWeb3React();
    const connectWalletByLocalStorage = useCallback(
        () => {
            const walletName = localStorage.getItem("wallet");
            const login_status = localStorage.getItem("login_status");
            console.log('ymj', walletName, login_status);
            if (login_status == 'off'){
                return;
            }
            if (walletName === 'metamask' ) {
                activate(injected);
            }else {
                console.log("wallet ERROR");
                activate(injected);
            }
            localStorage.setItem("login_status", "on")
        },
        [activate],
    )

    return connectWalletByLocalStorage;
}
