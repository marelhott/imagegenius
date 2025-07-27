import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { generationSettingsSchema } from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Image generation endpoint
  app.post('/api/generate', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
      }

      // Parse and validate settings
      const settingsData = JSON.parse(req.body.settings || '{}');
      const settings = generationSettingsSchema.parse(settingsData);

      // Create generation record
      const generation = await storage.createGeneration({
        inputImageUrl: `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
        model: settings.model,
        sampler: settings.sampler,
        cfgScale: settings.cfgScale,
        steps: settings.steps,
        denoiseStrength: settings.denoiseStrength,
        status: 'processing',
        outputImageUrl: null,
        userId: null, // For now, no user authentication
      });

      // Simulate AI processing time and return result directly
      setTimeout(async () => {
        try {
          // In real implementation, this would call the AI service
          // For now, return a placeholder image URL
          const mockOutputUrl = "https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600";
          
          await storage.updateGeneration(generation.id, {
            status: 'completed',
            outputImageUrl: mockOutputUrl,
          });
        } catch (error) {
          console.error('Error updating generation:', error);
          await storage.updateGeneration(generation.id, {
            status: 'failed',
          });
        }
      }, 2000);

      // Return the result directly after processing simulation
      setTimeout(() => {
        res.json({
          outputUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          status: 'completed',
          message: 'Generation completed successfully',
        });
      }, 2500);
    } catch (error) {
      console.error('Generation error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Invalid settings', 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get generation status
  app.get('/api/generation/:id', async (req, res) => {
    try {
      const generation = await storage.getGeneration(req.params.id);
      if (!generation) {
        return res.status(404).json({ message: 'Generation not found' });
      }
      res.json(generation);
    } catch (error) {
      console.error('Error fetching generation:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
