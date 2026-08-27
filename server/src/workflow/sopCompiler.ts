import { AIProviderRouter, CompilationResult } from '../utils/aiProviderRouter';
import { BadRequestError } from '../utils/errors';

export class SOPCompiler {
  /**
   * Accepts natural language SOP text and returns a schema-validated compiled workflow graph
   */
  public static async compile(sopText: string): Promise<CompilationResult> {
    if (!sopText || sopText.trim().length < 10) {
      throw new BadRequestError('SOP procedure text must be at least 10 characters long');
    }

    return AIProviderRouter.generateWorkflowFromSOP(sopText);
  }
}
