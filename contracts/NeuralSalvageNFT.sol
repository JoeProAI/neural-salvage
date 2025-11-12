// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title NeuralSalvageNFT
 * @dev ERC-721 NFT contract for Neural Salvage platform
 * Features:
 * - Dual-chain architecture (Polygon + Arweave storage)
 * - Automatic royalties (EIP-2981)
 * - OpenSea compatible metadata
 * - Gas-optimized for Polygon
 */
contract NeuralSalvageNFT is ERC721, ERC721URIStorage, ERC721Royalty, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    // Contract metadata for OpenSea
    string private _contractURI;
    
    // Platform fee receiver
    address public platformWallet;
    
    // Events
    event NFTMinted(
        uint256 indexed tokenId,
        address indexed minter,
        string tokenURI,
        string arweaveId
    );
    
    event ContractURIUpdated(string newContractURI);
    
    constructor(
        address initialOwner,
        address _platformWallet
    ) ERC721("Neural Salvage", "NSLV") Ownable(initialOwner) {
        platformWallet = _platformWallet;
        
        // Set default royalty to 5% (500 basis points)
        _setDefaultRoyalty(_platformWallet, 500);
    }
    
    /**
     * @dev Mint new NFT with Arweave metadata URL
     * @param to Address to mint NFT to
     * @param metadataURI IPFS or Arweave URL pointing to metadata JSON
     * @param arweaveId Arweave transaction ID for permanent storage reference
     * @param royaltyRecipient Address to receive royalties
     * @param royaltyPercentage Royalty percentage in basis points (500 = 5%)
     */
    function mintNFT(
        address to,
        string memory metadataURI,
        string memory arweaveId,
        address royaltyRecipient,
        uint96 royaltyPercentage
    ) public onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);
        
        // Set individual royalty for this token
        if (royaltyRecipient != address(0) && royaltyPercentage > 0) {
            _setTokenRoyalty(tokenId, royaltyRecipient, royaltyPercentage);
        }
        
        emit NFTMinted(tokenId, to, metadataURI, arweaveId);
        
        return tokenId;
    }
    
    /**
     * @dev Batch mint multiple NFTs (gas optimization)
     */
    function batchMintNFT(
        address[] memory recipients,
        string[] memory metadataURIs,
        string[] memory arweaveIds,
        address royaltyRecipient,
        uint96 royaltyPercentage
    ) public onlyOwner returns (uint256[] memory) {
        require(
            recipients.length == metadataURIs.length && 
            recipients.length == arweaveIds.length,
            "Array length mismatch"
        );
        
        uint256[] memory tokenIds = new uint256[](recipients.length);
        
        for (uint256 i = 0; i < recipients.length; i++) {
            tokenIds[i] = mintNFT(
                recipients[i],
                metadataURIs[i],
                arweaveIds[i],
                royaltyRecipient,
                royaltyPercentage
            );
        }
        
        return tokenIds;
    }
    
    /**
     * @dev Set contract-level metadata for OpenSea
     */
    function setContractURI(string memory newContractURI) public onlyOwner {
        _contractURI = newContractURI;
        emit ContractURIUpdated(newContractURI);
    }
    
    /**
     * @dev Returns contract-level metadata URI
     */
    function contractURI() public view returns (string memory) {
        return _contractURI;
    }
    
    /**
     * @dev Update platform wallet for royalties
     */
    function setPlatformWallet(address newPlatformWallet) public onlyOwner {
        require(newPlatformWallet != address(0), "Invalid address");
        platformWallet = newPlatformWallet;
        _setDefaultRoyalty(newPlatformWallet, 500);
    }
    
    /**
     * @dev Update default royalty percentage
     */
    function setDefaultRoyalty(address receiver, uint96 feeNumerator) public onlyOwner {
        _setDefaultRoyalty(receiver, feeNumerator);
    }
    
    /**
     * @dev Get total supply of NFTs
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    // The following functions are overrides required by Solidity
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, ERC721Royalty)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage, ERC721Royalty) {
        super._burn(tokenId);
    }
}
