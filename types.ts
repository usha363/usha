
export enum DriverState {
  ALERT = 'ALERT',
  DISTRACTED = 'DISTRACTED',
  DROWSY = 'DROWSY',
  UNRESPONSIVE = 'UNRESPONSIVE'
}

export enum DriveMode {
  MANUAL = 'MANUAL',
  AUTONOMOUS = 'AUTONOMOUS',
  EMERGENCY_CONTROL = 'EMERGENCY_CONTROL'
}

export enum RoadType {
  HIGHWAY = 'HIGHWAY',
  CITY = 'CITY',
  RESIDENTIAL = 'RESIDENTIAL',
  ROADSIDE = 'ROADSIDE'
}

export enum TORUrgency {
  NONE = 'NONE',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export interface SystemLog {
  id: string;
  timestamp: number;
  message: string;
  type: 'info' | 'warning' | 'critical';
}

export interface DriverMetrics {
  eyesOpen: boolean;
  faceDetected: boolean;
  headPose: 'forward' | 'left' | 'right' | 'down';
  blinkDuration: number;
  readinessScore: number;
}

export interface EmergencyContext {
  hospitalName: string;
  distance: string;
  contactName: string;
  isCalling: boolean;
}
