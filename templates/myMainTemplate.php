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
<div id="app-navigation-vue" class="app-navigation">

</div>
<main id="app-content-vue" class="app-content no-snapper">
    <table class="content-list" id="content-list">
        
    </table>
</main>
<meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 
'unsafe-eval' https://*.microsoftonline.com https://microsoftonline.com;child-src 'self' 'unsafe- 
inline' 'unsafe-eval' https://*.microsoftonline.com https://microsoftonline.com; object-src 'self' 
'unsafe-inline' 'unsafe-eval' https://*.microsoftonline.com https://microsoftonline.com; script-src 
'self' 'unsafe-inline' 'unsafe-eval' https://*.microsoftonline.com https://microsoftonline.com; img-src 
'self' 'unsafe-inline' 'unsafe-eval' https://*.microsoftonline.com https://microsoftonline.com; 
'form-action' https://*.microsoftonline.com https://microsoftonline.com;child-src;">