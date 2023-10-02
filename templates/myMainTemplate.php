<?php
use OCP\Util;
$appId = OCA\Azure\AppInfo\Application::APP_ID;
Util::addScript($appId, $appId . '-azureScript');
Util::addStyle($appId, 'main');
?>

<div id="vm-header">    VM LIST BELOW</div>
<div id="vm-footer"></div>