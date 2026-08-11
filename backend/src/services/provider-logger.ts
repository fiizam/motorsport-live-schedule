export class ProviderLogger {
  static log(
    provider: string,
    url: string,
    status: number,
    responseLength: number,
    mappingResult: string,
    error: string | null = null
  ) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      provider,
      url,
      status,
      responseLength,
      mappingResult,
      error
    };
    
    console.log(`[PROVIDER LOG] ${JSON.stringify(logEntry)}`);
  }
}
