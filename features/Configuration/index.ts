/**
 * Configuration Feature Public API
 * 
 * This module exports the minimal public interface for the Configuration feature.
 * Internal components, hooks, and domain objects are used internally and don't 
 * need to be part of the public API.
 */

// Main UI Component - Primary Public API
export { ConfigurationModal } from './presentation/ConfigurationModal';

// Domain Types - Required by server actions
export { type ConfigurationForm } from './domain/schemas/ConfigurationSchemas';