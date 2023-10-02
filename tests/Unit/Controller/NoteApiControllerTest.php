<?php
declare(strict_types=1);
// SPDX-FileCopyrightText: Bradley Consuegra <admin@nextcloud.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

namespace OCA\Azure\Tests\Unit\Controller;

use OCA\Azure\Controller\NoteApiController;

class NoteApiControllerTest extends NoteControllerTest {
	public function setUp(): void {
		parent::setUp();
		$this->controller = new NoteApiController($this->request, $this->service, $this->userId);
	}
}
