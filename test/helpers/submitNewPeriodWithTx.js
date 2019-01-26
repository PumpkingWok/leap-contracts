import { Period, Block } from 'leap-core';

export default async (txs, bridge, opts) => {
  // create block
  const block = txs.reduce(
    (b, tx) => b.addTx(tx),
    new Block(33)
  );
  
  // create new period
  const prevPeriodRoot = await bridge.tipHash();
  const period = new Period(prevPeriodRoot, [block]);

  let { slotId } = opts;
  let { signerAddr } = opts;
  slotId = (slotId) || 0;
  signerAddr = (signerAddr) || '0x0000000000000000000000000000000000000000';
  period.setValidatorData(slotId, signerAddr);
  const newPeriodRoot = period.proof(txs[0])[0];

  await bridge.submitProofPeriod(prevPeriodRoot, period.merkleRoot(), newPeriodRoot, opts).should.be.fulfilled;
  return period;
};