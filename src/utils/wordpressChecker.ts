// src/utils/wordpressChecker.ts
// Utility to check WordPress plugin status

export const checkWordPressPlugins = async () => {
  try {
    // Check if WordPress REST API is available
    const wpResponse = await fetch('/wp-json');
    const wpData = await wpResponse.json();
    
    console.log('WordPress REST API Available:', wpResponse.ok);
    console.log('WordPress API Info:', wpData);
    
    // Check if WooCommerce is available
    const wcResponse = await fetch('/wp-json/wc/v3');
    const wcData = await wcResponse.json();
    
    console.log('WooCommerce API Available:', wcResponse.ok);
    console.log('WooCommerce API Info:', wcData);
    
    // Check if JWT Auth is available
    const jwtResponse = await fetch('/wp-json/jwt-auth/v1');
    const jwtData = await jwtResponse.json();
    
    console.log('JWT Auth API Available:', jwtResponse.ok);
    console.log('JWT Auth API Info:', jwtData);
    
    return {
      wordpress: wpResponse.ok,
      woocommerce: wcResponse.ok,
      jwtAuth: jwtResponse.ok,
      apiInfo: {
        wordpress: wpData,
        woocommerce: wcData,
        jwtAuth: jwtData
      }
    };
  } catch (error) {
    console.error('Error checking WordPress plugins:', error);
    return {
      wordpress: false,
      woocommerce: false,
      jwtAuth: false,
      error: (error as Error).message
    };
  }
};

// Check if required plugins are active
export const checkRequiredPlugins = async () => {
  const pluginStatus = await checkWordPressPlugins();
  
  const missingPlugins = [];
  
  if (!pluginStatus.wordpress) {
    missingPlugins.push('WordPress REST API');
  }
  
  if (!pluginStatus.woocommerce) {
    missingPlugins.push('WooCommerce');
  }
  
  if (!pluginStatus.jwtAuth) {
    missingPlugins.push('JWT Authentication for WP REST API');
  }
  
  return {
    allPluginsActive: missingPlugins.length === 0,
    missingPlugins,
    pluginStatus
  };
};