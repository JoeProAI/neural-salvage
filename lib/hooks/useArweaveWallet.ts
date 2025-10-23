/**
 * ArConnect Wallet Hook
 * For connecting to user's Arweave wallet
 */

import { useState, useEffect } from 'react';

interface ArweaveWallet {
  address: string | null;
  connected: boolean;
  connecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

// ArConnect types are provided by the installed package
// No need to declare them here

export function useArweaveWallet(): ArweaveWallet {
  const [address, setAddress] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if wallet is already connected on mount
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      if (!window.arweaveWallet) {
        return;
      }

      const permissions = await window.arweaveWallet.getPermissions();
      if (permissions.length > 0) {
        const addr = await window.arweaveWallet.getActiveAddress();
        setAddress(addr);
        setConnected(true);
      }
    } catch (err) {
      console.log('No wallet connected');
    }
  };

  const connect = async () => {
    try {
      setConnecting(true);
      setError(null);

      if (!window.arweaveWallet) {
        throw new Error('ArConnect wallet not found. Please install ArConnect extension.');
      }

      // Request permissions
      await window.arweaveWallet.connect([
        'ACCESS_ADDRESS',
        'SIGN_TRANSACTION',
      ]);

      // Get address
      const addr = await window.arweaveWallet.getActiveAddress();
      setAddress(addr);
      setConnected(true);
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setError(err.message || 'Failed to connect wallet');
      setConnected(false);
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      if (window.arweaveWallet) {
        await window.arweaveWallet.disconnect();
      }
      setAddress(null);
      setConnected(false);
    } catch (err) {
      console.error('Wallet disconnect error:', err);
    }
  };

  return {
    address,
    connected,
    connecting,
    error,
    connect,
    disconnect,
  };
}
