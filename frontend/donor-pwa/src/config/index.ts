const title = 'Donor Portal';

const email = 'support@augeo.app';

const repository = 'https://github.com/jeanesdev/augeo-platform';

const dateFormat = 'MMMM DD, YYYY';

const loader = {
  // no more blinking in your app
  delay: 300, // if your asynchronous process is finished during 300 milliseconds you will not see the loader at all
  minimumLoading: 700, // but if it appears, it will stay for at least 700 milliseconds
};

const defaultMetaTags = {
  image: '/cover.png',
  description: 'Augeo Donor Portal - Access your event information',
};

export { loader, dateFormat, repository, email, title, defaultMetaTags };
