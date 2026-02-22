<?php

declare(strict_types=1);

namespace App\Service;

class DomainValidator
{
    public function isAllowed(string $origin, array $allowedDomains): bool
    {
        if (in_array('*', $allowedDomains, true)) {
            return true;
        }

        $originHost = parse_url($origin, PHP_URL_HOST);
        if ($originHost === null || $originHost === false) {
            return false;
        }

        foreach ($allowedDomains as $pattern) {
            $patternHost = parse_url($pattern, PHP_URL_HOST) ?: $pattern;

            if ($patternHost === $originHost) {
                return true;
            }

            // Support wildcard patterns like *.example.com
            if (str_starts_with($patternHost, '*.')) {
                $suffix = substr($patternHost, 1); // .example.com
                if (str_ends_with($originHost, $suffix)) {
                    return true;
                }
            }
        }

        return false;
    }
}
