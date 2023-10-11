﻿using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Reflection;
using Jint.Runtime.Interop;

namespace Jint
{
    public class Options
    {
        private bool _discardGlobal;
        private bool _strict;
        private bool _allowDebuggerStatement;
        private bool _debugMode;
        private bool _allowClr;
        private readonly List<IObjectConverter> _objectConverters = new List<IObjectConverter>();
        private int _maxStatements;
        private int _maxRecursionDepth = -1; 
        private TimeSpan _timeoutInterval;
        private CultureInfo _culture = CultureInfo.CurrentCulture;
        private TimeZoneInfo _localTimeZone = TimeZoneInfo.Utc;
        private List<Assembly> _lookupAssemblies = new List<Assembly>();
        private Predicate<Exception> _clrExceptionsHandler;

        /// <summary>
        /// When called, doesn't initialize the global scope.
        /// Can be useful in lightweight scripts for performance reason.
        /// </summary>
        public Options DiscardGlobal(bool discard = true)
        {
            _discardGlobal = discard;
            return this;
        }

        /// <summary>
        /// Run the script in strict mode.
        /// </summary>
        public Options Strict(bool strict = true)
        {
            _strict = strict;
            return this;
        }

        /// <summary>
        /// Allow the <code>debugger</code> statement to be called in a script.
        /// </summary>
        /// <remarks>
        /// Because the <code>debugger</code> statement can start the 
        /// Visual Studio debugger, is it disabled by default
        /// </remarks>
        public Options AllowDebuggerStatement(bool allowDebuggerStatement = true)
        {
            _allowDebuggerStatement = allowDebuggerStatement;
            return this;
        }

        /// <summary>
        /// Allow to run the script in debug mode.
        /// </summary>
        public Options DebugMode(bool debugMode = true)
        {
            _debugMode = debugMode;
            return this;
        }

        /// <summary>
         /// Adds a <see cref="IObjectConverter"/> instance to convert CLR types to <see cref="JsValue"/>
        /// </summary>
        public Options AddObjectConverter(IObjectConverter objectConverter)
        {
            _objectConverters.Add(objectConverter);
            return this;
        }

        /// <summary>
        /// Allows scripts to call CLR types directly like <example>System.IO.File</example>
        /// </summary>
        public Options AllowClr(params Assembly[] assemblies)
        {
            _allowClr = true;
            _lookupAssemblies.AddRange(assemblies);
            _lookupAssemblies = _lookupAssemblies.Distinct().ToList();
            return this;
        }

        /// <summary>
        /// Exceptions thrown from CLR code are converted to JavaScript errors and
        /// can be used in at try/catch statement. By default these exceptions are bubbled
        /// to the CLR host and interrupt the script execution.
        /// </summary>
        public Options CatchClrExceptions()
        {
            CatchClrExceptions(_ => true);
            return this;
        }

        /// <summary>
        /// Exceptions that thrown from CLR code are converted to JavaScript errors and
        /// can be used in at try/catch statement. By default these exceptions are bubbled
        /// to the CLR host and interrupt the script execution.
        /// </summary>
        public Options CatchClrExceptions(Predicate<Exception> handler)
        {
            _clrExceptionsHandler = handler;
            return this;
        }

        public Options MaxStatements(int maxStatements = 0)
        {
            _maxStatements = maxStatements;
            return this;
        }
        
        public Options TimeoutInterval(TimeSpan timeoutInterval)
        {
            _timeoutInterval = timeoutInterval;
            return this;
        }

        /// <summary>
        /// Sets maximum allowed depth of recursion.
        /// </summary>
        /// <param name="maxRecursionDepth">
        /// The allowed depth.
        /// a) In case max depth is zero no recursion is allowed.
        /// b) In case max depth is equal to n it means that in one scope function can be called no more than n times.
        /// </param>
        /// <returns>Options instance for fluent syntax</returns>
        public Options LimitRecursion(int maxRecursionDepth = 0)
        {
            _maxRecursionDepth = maxRecursionDepth;
            return this;
        }

        public Options Culture(CultureInfo cultureInfo)
        {
            _culture = cultureInfo;
            return this;
        }

        public Options LocalTimeZone(TimeZoneInfo timeZoneInfo)
        {
            _localTimeZone = timeZoneInfo;
            return this;
        }

        internal bool _IsGlobalDiscarded
		{
			get{ return _discardGlobal; }
		}

        internal bool _IsStrict
		{
			get{ return _strict; }
		}

        internal bool _IsDebuggerStatementAllowed
		{
			get{ return _allowDebuggerStatement; }
		}
		
        internal bool _IsDebugMode
		{
			get{ return _debugMode; }
		}
		
        internal bool _IsClrAllowed
		{
			get{ return _allowClr; }
		}
		
        internal Predicate<Exception> _ClrExceptionsHandler
		{
			get{ return _clrExceptionsHandler; }
		}
		
        internal IList<Assembly> _LookupAssemblies
		{
			get{ return _lookupAssemblies; }
		}
		
        internal IEnumerable<IObjectConverter> _ObjectConverters
		{
			get{ return _objectConverters; }
		}
		
        internal int _MaxStatements
		{
			get{ return _maxStatements; }
		}
		
        internal int _MaxRecursionDepth
		{
			get{ return _maxRecursionDepth; }
		}
		
        internal TimeSpan _TimeoutInterval
		{
			get{ return _timeoutInterval; }
		}
		
        internal CultureInfo _Culture
		{
			get{ return _culture; }
		}
		
        internal TimeZoneInfo _LocalTimeZone
		{
			get{ return _localTimeZone; }
		}
		
    }
}
