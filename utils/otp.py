#!/usr/bin/env python

# EXECUTE AS:
# python otp.py [key]

import sys
import pyotp

if (len(sys.argv)<2):
  print("! Put key as argument when executing")
else:
  print(pyotp.TOTP(sys.argv[1]).now())
