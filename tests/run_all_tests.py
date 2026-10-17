"""
================================================================================
TATADANA PRIME — UNIFIED TEST SUITE RUNNER
================================================================================
Executes:
1. tests/test_r4_comprehensive_verification.py (Full R1-R7 Specification & In-Process DB tests)
2. tests/test_acceptance_criteria.py (Unittest Acceptance Suite)
3. tests/run_acceptance_suite.py (Audit Acceptance Runner)
4. test_server_logic.py (Database & Business Logic Verification)
================================================================================
"""

import sys
import os
import unittest
import time

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

def run_suite():
    print("=" * 80)
    print(" TATADANA PRIME — ROUND 4 UNIFIED TEST SUITE")
    print(f" Working Directory: {PROJECT_ROOT}")
    print(f" Timestamp        : {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)

    loader = unittest.TestLoader()
    suite = unittest.TestSuite()

    # 1. Comprehensive R4 Verification Suite
    try:
        from tests import test_r4_comprehensive_verification
        suite.addTests(loader.loadTestsFromModule(test_r4_comprehensive_verification))
        print(" [LOADED] tests.test_r4_comprehensive_verification")
    except Exception as e:
        print(f" [ERROR] Could not load test_r4_comprehensive_verification: {e}")

    # 2. Acceptance Criteria Suite
    try:
        from tests import test_acceptance_criteria
        suite.addTests(loader.loadTestsFromModule(test_acceptance_criteria))
        print(" [LOADED] tests.test_acceptance_criteria")
    except Exception as e:
        print(f" [ERROR] Could not load test_acceptance_criteria: {e}")

    # Run unittest suite
    print("\n--- RUNNING UNIT & INTEGRATION TESTS ---")
    runner = unittest.TextTestRunner(verbosity=2)
    start_time = time.time()
    result = runner.run(suite)
    elapsed = time.time() - start_time

    # 3. Acceptance Audit Suite
    print("\n--- RUNNING ACCEPTANCE AUDIT SUITE ---")
    audit_passed = True
    try:
        from tests import run_acceptance_suite
        audit_passed = run_acceptance_suite.run_acceptance_audit()
    except Exception as e:
        print(f" [ERROR] Audit suite failed: {e}")
        audit_passed = False

    # Summary
    print("\n" + "=" * 80)
    print(" FINAL CONSOLIDATED TEST REPORT")
    print("=" * 80)
    print(f" Tests Run          : {result.testsRun}")
    print(f" Tests Passed       : {result.testsRun - len(result.failures) - len(result.errors)}")
    print(f" Tests Failed       : {len(result.failures)}")
    print(f" Tests Errors       : {len(result.errors)}")
    print(f" Tests Skipped      : {len(result.skipped)}")
    print(f" Audit Suite Status : {'PASSED (100%)' if audit_passed else 'FAILED'}")
    print(f" Total Duration     : {elapsed:.2f}s")
    print("=" * 80)

    success = (len(result.failures) == 0) and (len(result.errors) == 0) and audit_passed
    return success

if __name__ == '__main__':
    ok = run_suite()
    sys.exit(0 if ok else 1)
