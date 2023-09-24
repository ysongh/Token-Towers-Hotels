//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./ERC6551Registry.sol";
import "./HotelNFT.sol";

contract OnChainBoardGame {
  ERC6551Registry public registry;
  HotelNFT public hotelNFT;

  Hotel[] public hotels;
  address public immutable owner;
  mapping(address => address) public tbaList;
  mapping(address => uint256) public player;
  mapping(address => uint256[]) public properties;

  struct Hotel {
    uint id;
    string level;
    uint cost;
    address owner;
  }

  constructor(address _owner, address _registryAddress, address _hotelNFTAddress) {
    owner = _owner;
    registry = ERC6551Registry(_registryAddress);
    hotelNFT = HotelNFT(_hotelNFTAddress);

    for (uint256 id = 0; id < 20; id++) {
      hotels.push(Hotel(id, "hotel", 0, address(0)));
    }
  }

  function getHotels() public view returns (Hotel[] memory){
    return hotels;
  }

  function getPropertiesByPlayer(address playerAddress) public view returns (uint256[] memory){
    return properties[playerAddress];
  }

  function createTokenBoundAccount(
    address _implementation,
    uint256 _chainId,
    address _tokenContract,
    uint256 _tokenId,
    uint256 _salt,
    bytes calldata _initData
  ) external {
    address newTBA = registry.createAccount(_implementation, _chainId, _tokenContract, _tokenId, _salt, _initData);
    tbaList[msg.sender] = newTBA;
  }

  function moveNFT() public {
    uint256 randomNumber = uint256(keccak256(abi.encode(block.timestamp, msg.sender))) % 5;
    player[msg.sender] += randomNumber + 1;

    if (player[msg.sender] >= 20) {
      player[msg.sender] = 0;
    }
  }

  function buyHotel() public {
    hotels[player[msg.sender]].owner = msg.sender;
    properties[msg.sender].push(player[msg.sender]);
    hotelNFT.mintHotelNFT(hotels[player[msg.sender]].id, msg.sender, "");
  }

  modifier isOwner() {
    require(msg.sender == owner, "Not the Owner");
    _;
  }

  function withdraw() public isOwner {
    (bool success, ) = owner.call{ value: address(this).balance }("");
    require(success, "Failed to send Ether");
  }

  receive() external payable {}
}