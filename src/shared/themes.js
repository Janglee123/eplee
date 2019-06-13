const dark = {
  body: {
    background: `#444 !important`,
    color: `#fff !important`,
  },
  '*': {
    color: 'inherit !important',
    background: 'inherit !important',
  },
  'a:link': {
    color: `#1e83d2 !important`,
    'text-decoration': 'none !important',
  },
  'a:link:hover': {
    background: 'rgba(0, 0, 0, 0.1) !important',
  },
};

const light = {
  body: {},
  '*': {},
  'a:link': {},
  'a:link:hover': {},
};

const tan = {
  body: {
    background: `#fdf6e3 !important`,
    color: `#002b36 !important`,
  },
  '*': {
    color: 'inherit !important',
    background: 'inherit !important',
  },
  'a:link': {
    color: `#268bd2 !important`,
    'text-decoration': 'none !important',
  },
  'a:link:hover': {
    background: 'rgba(0, 0, 0, 0.1) !important',
  },
};

export { dark, light, tan };
