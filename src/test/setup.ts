import 'reflect-metadata';
import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';
import { configureDI } from '@/core/infrastructure/di/container';

// Configure dependency injection for all tests
configureDI();
