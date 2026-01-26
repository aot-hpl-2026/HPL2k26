let runtime = {
  io: null,
  redis: null
};

export const setRuntime = (next) => {
  runtime = { ...runtime, ...next };
};

export const getRuntime = () => runtime;
