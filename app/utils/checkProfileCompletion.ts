interface UserProfile {
    name: string;
    campus: string;
    major: string;
    // Add other required fields here
  }
  
  export const checkProfileCompletion = (profile: UserProfile | null): boolean => {
    if (!profile) return false;
    
    // Check for required fields
    return !!(
      profile.name &&
      profile.campus &&
      profile.major
    );
  };