// We use a different internal data structure for biases than in Kobold.
// Kobold stores biases as tuples in an object with the phrase as the key. { [phrase: string]: [bias: number, completionThreshold: number] }
// But we want to be able to temporarily store biases containing duplicate phrases, so items don't disappear during typing the moment they have a key collision.
export type LocalBias = {
  phrase: string;
  bias: number;
  completionThreshold: number;
};

export type LocalBiases = LocalBias[];

export type RemoteBiases = {
  [key: string]: [number, number];
};

export const localToRemoteBiases = (localBiases: LocalBiases): RemoteBiases => {
  return localBiases.reduce(
    (acc: RemoteBiases, localBias) =>
      localBias.phrase.length
        ? {
            ...acc,
            [localBias.phrase]: [localBias.bias, localBias.completionThreshold],
          }
        : acc,
    {}
  );
};

export const remoteToLocalBiases = (remoteBiases: RemoteBiases): LocalBiases =>
  remoteBiases
    ? Object.entries(remoteBiases).map(
        ([phrase, [bias, completionThreshold]]) => ({
          phrase,
          bias,
          completionThreshold,
        })
      )
    : [];
