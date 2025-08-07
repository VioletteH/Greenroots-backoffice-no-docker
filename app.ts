import express from 'express';
import routes from './app/routes/index';
import cors from 'cors';
import methodOverride from 'method-override';
import cookieParser from 'cookie-parser';

import { isLogged } from './app/middleware/isLogged';
import { errorHandler } from './app/middleware/errorHandler';

import helmet from 'helmet';

const app = express();
app.use(cors());

const allowedOrigins = [
  process.env.FRONTA,
  process.env.FRONTB,
];

app.use('/uploads', cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error('CORS blocked on /uploads:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.static('public'));
app.use('/icons', express.static(__dirname + '/node_modules/bootstrap-icons/font'));

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'" 
        ],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
        imgSrc: ["'self'", "data:", "blob:", "http://localhost:3000", "http://localhost:5173", "http://localhost:5174"], 
        objectSrc: ["'none'"],
        scriptSrcAttr: null,
        upgradeInsecureRequests: [],
      },
    },
  })
);

const PORT = 3000;

app.use(cookieParser());

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

app.set('view engine', 'ejs');
app.set('views', 'app/views');

app.use(isLogged);

app.use(routes);

app.use((req, res, next) => {
  res.status(404).render('error/404');
});

app.use(errorHandler);

app.listen(PORT, () => {
   console.log(`Example app listening on port http://localhost:${PORT}`)
 });