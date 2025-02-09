import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  Deposited,
  Invested,
  OwnershipTransferred,
  WithdrawInvestment,
  Withdrawn,
  tokenOutEvent
} from "../generated/AIInvestmentPool/AIInvestmentPool"

export function createDepositedEvent(user: Address, amount: BigInt): Deposited {
  let depositedEvent = changetype<Deposited>(newMockEvent())

  depositedEvent.parameters = new Array()

  depositedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  depositedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return depositedEvent
}

export function createInvestedEvent(user: Address, amount: BigInt): Invested {
  let investedEvent = changetype<Invested>(newMockEvent())

  investedEvent.parameters = new Array()

  investedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  investedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return investedEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent =
    changetype<OwnershipTransferred>(newMockEvent())

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createWithdrawInvestmentEvent(
  user: Address,
  amount: BigInt
): WithdrawInvestment {
  let withdrawInvestmentEvent = changetype<WithdrawInvestment>(newMockEvent())

  withdrawInvestmentEvent.parameters = new Array()

  withdrawInvestmentEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  withdrawInvestmentEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return withdrawInvestmentEvent
}

export function createWithdrawnEvent(user: Address, amount: BigInt): Withdrawn {
  let withdrawnEvent = changetype<Withdrawn>(newMockEvent())

  withdrawnEvent.parameters = new Array()

  withdrawnEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  withdrawnEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return withdrawnEvent
}

export function createtokenOutEventEvent(
  token: Address,
  amount: BigInt
): tokenOutEvent {
  let tokenOutEventEvent = changetype<tokenOutEvent>(newMockEvent())

  tokenOutEventEvent.parameters = new Array()

  tokenOutEventEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  tokenOutEventEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return tokenOutEventEvent
}
