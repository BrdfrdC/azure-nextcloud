<?php
use OCP\Util;
$appId = OCA\Azure\AppInfo\Application::APP_ID;
Util::addScript($appId, $appId . '-azureScript');
Util::addStyle($appId, 'main');
?>

<?php
	header("Content-Security-Policy: default-src 'self' 'unsafe-inline' 
    'unsafe-eval' https://*.microsoftonline.com https://microsoftonline.com;child-src 'self' 'unsafe- 
    inline' 'unsafe-eval' https://*.microsoftonline.com https://microsoftonline.com; object-src 'self' 
    'unsafe-inline' 'unsafe-eval' https://*.microsoftonline.com https://microsoftonline.com; script-src 
    'self' 'unsafe-inline' 'unsafe-eval' https://*.microsoftonline.com https://microsoftonline.com; img-src 
    'self' 'unsafe-inline' 'unsafe-eval' https://*.microsoftonline.com https://microsoftonline.com; 
    'form-action' https://*.microsoftonline.com https://microsoftonline.com;child-src;");
?>

<div id="vm-header">    VM LIST BELOW</div>
<div id="vm-footer"></div>
<meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 
'unsafe-eval' https://*.microsoftonline.com https://microsoftonline.com;child-src 'self' 'unsafe- 
inline' 'unsafe-eval' https://*.microsoftonline.com https://microsoftonline.com; object-src 'self' 
'unsafe-inline' 'unsafe-eval' https://*.microsoftonline.com https://microsoftonline.com; script-src 
'self' 'unsafe-inline' 'unsafe-eval' https://*.microsoftonline.com https://microsoftonline.com; img-src 
'self' 'unsafe-inline' 'unsafe-eval' https://*.microsoftonline.com https://microsoftonline.com; 
'form-action' https://*.microsoftonline.com https://microsoftonline.com;child-src;">