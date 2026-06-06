#!/bin/bash

# Cut Adrift — End-to-end site test
# Run from anywhere: bash ~/Desktop/test-cutadrift.sh

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'
BOLD='\033[1m'

PASS=0
FAIL=0

check() {
  local label="$1"
  local url="$2"
  local expected="${3:-200}"
  local status
  status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url")
  if [ "$status" = "$expected" ]; then
    echo -e "  ${GREEN}✓${NC} $label ${YELLOW}($status)${NC}"
    ((PASS++))
  else
    echo -e "  ${RED}✗${NC} $label — got ${RED}$status${NC}, expected $expected"
    ((FAIL++))
  fi
}

check_contains() {
  local label="$1"
  local url="$2"
  local needle="$3"
  local body
  body=$(curl -s --max-time 10 "$url")
  if echo "$body" | grep -q "$needle"; then
    echo -e "  ${GREEN}✓${NC} $label"
    ((PASS++))
  else
    echo -e "  ${RED}✗${NC} $label — '${needle}' not found"
    ((FAIL++))
  fi
}

echo ""
echo -e "${BOLD}Cut Adrift — End-to-end test${NC}"
echo -e "${YELLOW}$(date)${NC}"
echo "────────────────────────────────────────"

echo ""
echo -e "${BOLD}Core pages${NC}"
check "Homepage"                   "https://cutadrift.org/"
check "www redirect"               "https://www.cutadrift.org/"
check "Intake — when someone dies" "https://cutadrift.org/when-someone-dies/"
check "Plan page"                  "https://cutadrift.org/plan/"
check "Privacy page"               "https://cutadrift.org/privacy/"
check "404 page"                   "https://cutadrift.org/does-not-exist-xyz" "404"

echo ""
echo -e "${BOLD}NZ guide + specific pages${NC}"
check "NZ guide"                   "https://cutadrift.org/what-to-do-when-someone-dies-nz/"
check "Funeral grant"              "https://cutadrift.org/how-to-apply-funeral-grant-nz/"
check "KiwiSaver death claim"      "https://cutadrift.org/kiwisaver-death-claim-nz/"
check "Register a death"           "https://cutadrift.org/how-to-register-a-death-nz/"
check "Probate guide"              "https://cutadrift.org/nz-probate-guide/"
check "ACC death benefit"          "https://cutadrift.org/acc-death-benefit-nz/"

echo ""
echo -e "${BOLD}Assets${NC}"
check "Sitemap"                    "https://cutadrift.org/sitemap.xml"
check "Favicon"                    "https://cutadrift.org/favicon.svg"
check "OG image"                   "https://cutadrift.org/og-image.png"
check "Apple touch icon"           "https://cutadrift.org/apple-touch-icon.png"

echo ""
echo -e "${BOLD}Sitemap contains all pages${NC}"
check_contains "NZ guide in sitemap"        "https://cutadrift.org/sitemap.xml" "what-to-do-when-someone-dies-nz"
check_contains "Funeral grant in sitemap"   "https://cutadrift.org/sitemap.xml" "how-to-apply-funeral-grant-nz"
check_contains "KiwiSaver in sitemap"       "https://cutadrift.org/sitemap.xml" "kiwisaver-death-claim-nz"
check_contains "Register death in sitemap"  "https://cutadrift.org/sitemap.xml" "how-to-register-a-death-nz"
check_contains "Probate in sitemap"         "https://cutadrift.org/sitemap.xml" "nz-probate-guide"
check_contains "ACC in sitemap"             "https://cutadrift.org/sitemap.xml" "acc-death-benefit-nz"

echo ""
echo -e "${BOLD}Content checks${NC}"
check_contains "Homepage has guides section"      "https://cutadrift.org/"                                  "Bereavement guides"
check_contains "Homepage links to NZ guide"       "https://cutadrift.org/"                                  "what-to-do-when-someone-dies-nz"
check_contains "NZ guide links to funeral grant"  "https://cutadrift.org/what-to-do-when-someone-dies-nz/" "how-to-apply-funeral-grant-nz"
check_contains "NZ guide links to KiwiSaver"      "https://cutadrift.org/what-to-do-when-someone-dies-nz/" "kiwisaver-death-claim-nz"
check_contains "NZ guide links to probate"        "https://cutadrift.org/what-to-do-when-someone-dies-nz/" "nz-probate-guide"
check_contains "NZ guide links to ACC"            "https://cutadrift.org/what-to-do-when-someone-dies-nz/" "acc-death-benefit-nz"
check_contains "Apple touch icon on homepage"     "https://cutadrift.org/"                                  "apple-touch-icon"

echo ""
echo -e "${BOLD}Worker (AI engine)${NC}"
WORKER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 -X POST \
  "https://cutadrift-engine.waynemstevens.workers.dev/" \
  -H "Content-Type: application/json" \
  -H "Origin: https://cutadrift.org" \
  -d '{"tool":"bereavement","country":"nz","relationship":"spouse","circumstance":"illness","timeframe":"today","dependants":"none","property":"joint","will":"yes"}')
if [ "$WORKER_STATUS" = "200" ]; then
  echo -e "  ${GREEN}✓${NC} Worker responds to POST ${YELLOW}($WORKER_STATUS)${NC}"
  ((PASS++))
else
  echo -e "  ${RED}✗${NC} Worker — got ${RED}$WORKER_STATUS${NC}"
  ((FAIL++))
fi

echo ""
echo "────────────────────────────────────────"
echo -e "${BOLD}Results: ${GREEN}$PASS passed${NC}, ${RED}$FAIL failed${NC}"
echo ""
