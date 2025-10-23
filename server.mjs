import express from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './src/lib/server.ts';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// tRPC endpoint  
app.use('/api/trpc', createExpressMiddleware({
  router: appRouter,
  createContext: () => ({}),
}));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
