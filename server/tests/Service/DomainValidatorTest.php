<?php

declare(strict_types=1);

namespace App\Tests\Service;

use App\Service\DomainValidator;
use PHPUnit\Framework\TestCase;

class DomainValidatorTest extends TestCase
{
    private DomainValidator $validator;

    protected function setUp(): void
    {
        $this->validator = new DomainValidator();
    }

    public function testWildcardAllowsEverything(): void
    {
        $this->assertTrue($this->validator->isAllowed('https://anything.com', ['*']));
    }

    public function testExactDomainMatch(): void
    {
        $this->assertTrue($this->validator->isAllowed('https://example.com', ['example.com']));
    }

    public function testExactDomainMismatch(): void
    {
        $this->assertFalse($this->validator->isAllowed('https://other.com', ['example.com']));
    }

    public function testWildcardSubdomainMatch(): void
    {
        $this->assertTrue($this->validator->isAllowed('https://app.example.com', ['*.example.com']));
    }

    public function testWildcardSubdomainNestedMatch(): void
    {
        $this->assertTrue($this->validator->isAllowed('https://deep.app.example.com', ['*.example.com']));
    }

    public function testWildcardSubdomainMismatch(): void
    {
        $this->assertFalse($this->validator->isAllowed('https://example.org', ['*.example.com']));
    }

    public function testEmptyOrigin(): void
    {
        $this->assertFalse($this->validator->isAllowed('', ['example.com']));
    }

    public function testEmptyAllowedDomains(): void
    {
        $this->assertFalse($this->validator->isAllowed('https://example.com', []));
    }
}
