export interface NFT {
  id: string;
  tokenId: number;
  name: string;
  description: string;
  image: string;
  metadata: NFTMetadata;
  owner: string;
  collection: string;
  mintedAt: number;
  supplyCap: number;
  royalty: number;
  isFrozen: boolean;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: NFTAttribute[];
  isManipulated: boolean;
}

export interface NFTAttribute {
  trait_type: string;
  value: string;
}

export interface NFTCollection {
  id: string;
  name: string;
  symbol: string;
  totalSupply: number;
  maxSupply: number;
  owner: string;
  baseURI: string;
  isFrozen: boolean;
  isVulnerable: boolean;
}
